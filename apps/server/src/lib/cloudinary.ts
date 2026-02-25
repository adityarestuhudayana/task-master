import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME || "dvlyj7ezy",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

/**
 * Extracts the public_id from a Cloudinary URL.
 * Example URL: https://res.cloudinary.com/dvlyj7ezy/image/upload/v1740320456/taskmaster/sge5qofl8ofbmbj87lki.jpg
 * Public ID: taskmaster/sge5qofl8ofbmbj87lki
 */
export function getPublicIdFromUrl(url: string): string | null {
    if (!url || !url.includes("cloudinary.com")) return null

    try {
        const parts = url.split("/")
        const uploadIndex = parts.indexOf("upload")
        if (uploadIndex === -1) return null

        let startIndex = uploadIndex + 1

        // Cloudinary URL structure: .../upload/[transformations]/[version]/[public_id].[extension]
        // We need to skip transformations and the version segment
        while (startIndex < parts.length) {
            const segment = parts[startIndex]

            // Skip version: starts with 'v' followed by digits
            if (segment.startsWith("v") && /^\d+$/.test(segment.substring(1))) {
                startIndex++
                break
            }

            // Skip common transformation patterns (contain ',', '_', '=' or common prefixes)
            // If the NEXT segment is a version, this one is definitely a transformation
            if (startIndex + 1 < parts.length && parts[startIndex + 1].startsWith("v") && /^\d+$/.test(parts[startIndex + 1].substring(1))) {
                startIndex++
                continue
            }

            // If it looks like a transformation (contains characters like , or = or is one of the common single-letter codes)
            if (segment.includes(",") || segment.includes("=") || (segment.length <= 4 && /^[a-z]_/.test(segment))) {
                startIndex++
                continue
            }

            break
        }

        const publicIdWithExtension = parts.slice(startIndex).join("/")
        const lastDotIndex = publicIdWithExtension.lastIndexOf(".")
        const publicId = lastDotIndex === -1 ? publicIdWithExtension : publicIdWithExtension.substring(0, lastDotIndex)

        return publicId
    } catch (err) {
        console.error("[Cloudinary] Failed to extract public_id from URL:", url, err)
        return null
    }
}

/**
 * Deletes an image from Cloudinary by its URL.
 */
export async function deleteImageByUrl(url: string) {
    console.log(`[Cloudinary] Attempting to delete image for URL: ${url}`)
    const publicId = getPublicIdFromUrl(url)
    if (!publicId) {
        console.log(`[Cloudinary] Could not extract public_id from URL, skipping deletion.`)
        return
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log(`[Cloudinary] Deletion result for ${publicId}:`, result)
    } catch (err) {
        console.error(`[Cloudinary] Failed to delete image: ${publicId}`, err)
    }
}

export { cloudinary }
