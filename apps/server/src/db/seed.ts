import "dotenv/config";
import { db } from "./index.js";
import * as schema from "./schema.js";
import { fakerID_ID as faker } from "@faker-js/faker";
import { eq, inArray } from "drizzle-orm";
import { auth } from "../auth/index.js";

// Helper for batch inserting
async function batchInsert<T extends any>(
    table: any,
    data: T[],
    batchSize = 500
) {
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await db.insert(table).values(batch);
    }
}

async function main() {
    console.log("🌱 Seeding database...");

    // 0. Cleanup (Ensure a fresh state)
    console.log("🧹 Cleaning up existing data...");

    // Delete in order to avoid foreign key violations
    await db.delete(schema.notifications);
    await db.delete(schema.activity);
    await db.delete(schema.comments);
    await db.delete(schema.taskLabels);
    await db.delete(schema.taskAssignees);
    await db.delete(schema.tasks);
    await db.delete(schema.columns);
    await db.delete(schema.boardMembers);
    await db.delete(schema.boards);
    await db.delete(schema.workspaceInvitations);
    await db.delete(schema.workspaceMembers);
    await db.delete(schema.labels);
    await db.delete(schema.workspaces);
    await db.delete(schema.sessions);
    await db.delete(schema.accounts);
    await db.delete(schema.verifications);
    await db.delete(schema.users);
    console.log("✅ Cleanup completed");

    // 1. Users
    const userIds: string[] = [];

    // 1a. Specific 5 users with known passwords
    console.log("Creating 5 specific Indonesian users with standard passwords...");
    const specificUsers = [
        { email: "budi@indo.com", name: "Budi Santoso" },
        { email: "siti@indo.com", name: "Siti Aminah" },
        { email: "joko@indo.com", name: "Joko Widodo" },
        { email: "dewi@indo.com", name: "Dewi Lestari" },
        { email: "agus@indo.com", name: "Agus Pratama" },
    ];

    for (const u of specificUsers) {
        // We use auth to properly hash the password and create the account
        const res = await auth.api.signUpEmail({
            body: {
                email: u.email,
                password: "password123",
                name: u.name,
            },
        });
        if (res.user?.id) {
            userIds.push(res.user.id);
            // Manually verify the email since better-auth sets it to false
            await db.update(schema.users)
                .set({ emailVerified: true })
                .where(eq(schema.users.id, res.user.id));
        }
    }
    console.log("✅ 5 Specific users created (password: password123)");

    // 1b. Bulk dummy users
    console.log("Creating 1000 bulk dummy users...");
    const dummyUsers = Array.from({ length: 1000 }).map(() => {
        const id = faker.string.uuid();
        userIds.push(id);
        return {
            id,
            name: faker.person.fullName(),
            email: faker.internet.email(),
            emailVerified: true,
            image: faker.image.avatar(),
        };
    });

    await batchInsert(schema.users, dummyUsers);

    console.log(`✅ Total ${userIds.length} users ready for seeding`);

    // 2. Workspaces
    console.log("Creating workspaces...");
    const workspaceIds: string[] = [];
    const workspacesToInsert = [];
    const workspaceMembersToInsert = [];

    const numWorkspaces = 100;

    for (let i = 0; i < numWorkspaces; i++) {
        // Give specific users a better chance to own workspaces early on
        const ownerId = i < 5 ? userIds[i] : faker.helpers.arrayElement(userIds);
        const id = faker.string.uuid();

        workspacesToInsert.push({
            id,
            name: `${faker.company.name()} Workspace`,
            description: faker.company.catchPhrase(),
            icon: "💼",
            ownerId,
        });
        workspaceIds.push(id);

        workspaceMembersToInsert.push({
            workspaceId: id,
            userId: ownerId,
            role: "owner" as const,
        });

        // Add some random members (2-10 per workspace)
        const memberCount = faker.number.int({ min: 2, max: 10 });
        const randomMembers = faker.helpers.arrayElements(
            userIds.filter(u => u !== ownerId),
            memberCount
        );

        // Ensure our 5 specific users get added to first few workspaces they don't own
        if (i < 10) {
            for (let j = 0; j < 5; j++) {
                if (userIds[j] !== ownerId && !randomMembers.includes(userIds[j])) {
                    randomMembers.push(userIds[j]);
                }
            }
        }

        for (const otherUser of randomMembers) {
            workspaceMembersToInsert.push({
                workspaceId: id,
                userId: otherUser,
                role: faker.helpers.arrayElement(["admin", "member"] as const),
            });
        }
    }

    await batchInsert(schema.workspaces, workspacesToInsert);
    await batchInsert(schema.workspaceMembers, workspaceMembersToInsert);
    console.log(`✅ Created ${workspaceIds.length} workspaces and ${workspaceMembersToInsert.length} members`);

    // 3. Labels
    console.log("Creating labels...");
    const labelIdsPerWorkspace: Record<string, string[]> = {};
    const labelsToInsert = [];

    for (const wsId of workspaceIds) {
        const labels = ["Prioritas Tinggi", "Bug", "Fitur Baru", "Hutang Teknis", "UI/UX"];
        const ids: string[] = [];
        for (const name of labels) {
            const id = faker.string.uuid();
            labelsToInsert.push({
                id,
                workspaceId: wsId,
                name,
                color: faker.color.rgb(),
            });
            ids.push(id);
        }
        labelIdsPerWorkspace[wsId] = ids;
    }
    await batchInsert(schema.labels, labelsToInsert);
    console.log(`✅ Created ${labelsToInsert.length} labels`);

    // 4. Boards & Members
    console.log("Creating boards...");
    const boardIds: string[] = [];
    const boardsToInsert = [];
    const boardMembersToInsert = [];

    // Create ~1-5 boards per workspace
    for (const wsId of workspaceIds) {
        const boardCount = faker.number.int({ min: 1, max: 5 });

        // Find members of this workspace
        const members = workspaceMembersToInsert.filter(m => m.workspaceId === wsId);

        for (let i = 0; i < boardCount; i++) {
            const id = faker.string.uuid();
            boardsToInsert.push({
                id,
                workspaceId: wsId,
                name: `${faker.commerce.department()} Board`,
                color: faker.helpers.arrayElement(["bg-blue-500", "bg-red-500", "bg-green-500", "bg-purple-500", "bg-orange-500"]),
                status: "active" as const,
            });
            boardIds.push(id);

            // Add all workspace members to the board
            for (const member of members) {
                boardMembersToInsert.push({
                    boardId: id,
                    userId: member.userId,
                });
            }
        }
    }

    await batchInsert(schema.boards, boardsToInsert);
    await batchInsert(schema.boardMembers, boardMembersToInsert);
    console.log(`✅ Created ${boardsToInsert.length} boards and ${boardMembersToInsert.length} board members`);

    // 5. Columns
    console.log("Creating columns...");
    const columnIdsPerBoard: Record<string, string[]> = {};
    const columnsToInsert = [];

    for (const boardId of boardIds) {
        const colNames = ["Akan Dilakukan", "Sedang Berjalan", "Peninjauan", "Selesai"];
        const ids: string[] = [];
        for (let i = 0; i < colNames.length; i++) {
            const id = faker.string.uuid();
            columnsToInsert.push({
                id,
                boardId,
                name: colNames[i],
                position: i,
                color: faker.helpers.arrayElement(["bg-slate-400", "bg-blue-400", "bg-yellow-400", "bg-green-400"]),
            });
            ids.push(id);
        }
        columnIdsPerBoard[boardId] = ids;
    }

    await batchInsert(schema.columns, columnsToInsert);
    console.log(`✅ Created ${columnsToInsert.length} columns`);

    // 6. Tasks
    console.log("Creating tasks & activity...");
    const tasksToInsert = [];
    const taskAssigneesToInsert = [];
    const taskLabelsToInsert = [];
    const commentsToInsert = [];
    const activityToInsert = [];

    // Group columns by board
    const boardEntries = Object.entries(columnIdsPerBoard);

    // To avoid massive memory usage, we'll process 50 boards at a time
    for (let b = 0; b < boardEntries.length; b += 50) {
        const batchBoards = boardEntries.slice(b, b + 50);

        for (const [boardId, colIds] of batchBoards) {
            const board = boardsToInsert.find(b => b.id === boardId);
            if (!board) continue;

            const wsId = board.workspaceId;
            const wsLabels = labelIdsPerWorkspace[wsId] || [];
            const wsMembers = workspaceMembersToInsert.filter(m => m.workspaceId === wsId);

            if (wsMembers.length === 0) continue;

            for (const colId of colIds) {
                const taskCount = faker.number.int({ min: 2, max: 10 });
                for (let i = 0; i < taskCount; i++) {
                    const taskId = faker.string.uuid();
                    const isCompleted = colId === colIds[colIds.length - 1]; // Last column is "Done"

                    tasksToInsert.push({
                        id: taskId,
                        columnId: colId,
                        title: faker.hacker.phrase(),
                        description: faker.lorem.paragraph(),
                        position: i,
                        completed: isCompleted,
                        flagged: faker.datatype.boolean(0.1),
                        dueDate: faker.date.future(),
                    });

                    // Assign 1-3 members
                    const numAssignees = faker.number.int({ min: 1, max: Math.min(3, wsMembers.length) });
                    const assignees = faker.helpers.arrayElements(wsMembers, numAssignees);
                    for (const assignee of assignees) {
                        taskAssigneesToInsert.push({
                            taskId,
                            userId: assignee.userId,
                        });
                    }

                    // Assign 0-2 labels
                    if (wsLabels.length > 0) {
                        const numLabels = faker.number.int({ min: 0, max: Math.min(2, wsLabels.length) });
                        if (numLabels > 0) {
                            const labels = faker.helpers.arrayElements(wsLabels, numLabels);
                            for (const label of labels) {
                                taskLabelsToInsert.push({
                                    taskId,
                                    labelId: label,
                                });
                            }
                        }
                    }

                    // Comments (1 per task for specific assignee to reduce DB size a bit)
                    const mainAssignee = assignees[0];
                    commentsToInsert.push({
                        id: faker.string.uuid(),
                        taskId,
                        authorId: mainAssignee.userId,
                        content: faker.lorem.sentence(),
                    });

                    // Activity
                    activityToInsert.push({
                        id: faker.string.uuid(),
                        boardId,
                        taskId,
                        userId: mainAssignee.userId,
                        type: "update" as const,
                        message: "task diinisialisasi dengan data dummy",
                    });
                }
            }
        }

        // Execute batch insertion
        await batchInsert(schema.tasks, tasksToInsert);
        await batchInsert(schema.taskAssignees, taskAssigneesToInsert);
        await batchInsert(schema.taskLabels, taskLabelsToInsert);
        await batchInsert(schema.comments, commentsToInsert);
        await batchInsert(schema.activity, activityToInsert);

        // Clear references
        tasksToInsert.length = 0;
        taskAssigneesToInsert.length = 0;
        taskLabelsToInsert.length = 0;
        commentsToInsert.length = 0;
        activityToInsert.length = 0;
    }

    console.log("✅ Created tasks and related data");

    console.log("🚀 Seeding completed successfully!");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
