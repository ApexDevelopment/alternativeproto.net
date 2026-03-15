import type { SubmissionData } from "./types";

/**
 * Placeholder API call for submitting a new project.
 * In production, this would send data to a backend server.
 */
export async function submitProject(
	data: SubmissionData,
): Promise<{ success: boolean; message: string }> {
	// Simulate network delay
	await new Promise((resolve) => setTimeout(resolve, 1000));

	// Placeholder: Log the submission data
	console.log("Project submission received:", data);

	return {
		success: true,
		message:
			"Your submission has been received and is pending review. Thank you for contributing!",
	};
}
