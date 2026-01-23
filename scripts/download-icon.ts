#!/usr/bin/env npx ts-node

/**
 * Download and normalize an icon/image to PNG format
 *
 * Usage: npx ts-node scripts/download-icon.ts <url> <output-name>
 * Example: npx ts-node scripts/download-icon.ts https://example.com/icon.png bluesky
 *
 * Output: public/icons/<output-name>.png (128x128 PNG)
 */

import { mkdir } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");

// Target dimensions for normalized icons
const ICON_SIZE = 128;
const OUTPUT_DIR = join(__dirname, "..", "public", "icons");

async function downloadImage(url: string): Promise<Buffer> {
	console.log(`Downloading: ${url}`);
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(
			`Failed to download: ${response.status} ${response.statusText}`,
		);
	}

	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

async function normalizeIcon(
	imageBuffer: Buffer,
	outputName: string,
): Promise<string> {
	// Dynamic import for sharp (ESM compatibility)
	const sharp = (await import("sharp")).default;

	const outputPath = join(OUTPUT_DIR, `${outputName}.png`);

	// Ensure output directory exists
	await mkdir(OUTPUT_DIR, { recursive: true });

	// Process the image
	await sharp(imageBuffer)
		.resize(ICON_SIZE, ICON_SIZE, {
			fit: "contain",
			background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
		})
		.png({
			compressionLevel: 9,
			quality: 100,
		})
		.toFile(outputPath);

	return outputPath;
}

async function main() {
	const args = process.argv.slice(2);

	if (args.length < 2) {
		console.log(
			"Usage: npx ts-node scripts/download-icon.ts <url> <output-name>",
		);
		console.log(
			"Example: npx ts-node scripts/download-icon.ts https://example.com/icon.png bluesky",
		);
		console.log("");
		console.log("Output: public/icons/<output-name>.png (128x128 PNG)");
		process.exit(1);
	}

	const [url, outputName] = args;

	// Validate output name (alphanumeric, hyphens, underscores only)
	if (!/^[a-zA-Z0-9_-]+$/.test(outputName)) {
		console.error(
			"Error: Output name should only contain letters, numbers, hyphens, and underscores",
		);
		process.exit(1);
	}

	try {
		const imageBuffer = await downloadImage(url);
		console.log(`Downloaded ${imageBuffer.length} bytes`);

		const outputPath = await normalizeIcon(imageBuffer, outputName);
		console.log(`✓ Saved normalized icon to: ${outputPath}`);
		console.log(`  Size: ${ICON_SIZE}x${ICON_SIZE}px PNG`);
		console.log("");
		console.log(`Use in project: iconUrl: '/icons/${outputName}.png'`);
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();
