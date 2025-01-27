import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Helper function to get shop-specific reviews file path
function getReviewsPath(shop: string) {
  // Use /tmp directory in production (Vercel), data directory in development
  const baseDir = process.env.VERCEL ? '/tmp' : process.cwd();
  return path.join(baseDir, "data", `${shop}-reviews.json`);
}

// Helper function to read reviews
async function readReviews(shop: string) {
  try {
    const filePath = getReviewsPath(shop);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, return empty array
      return [];
    }
  } catch (error) {
    console.error("Error reading reviews:", error);
    throw error;
  }
}

// Helper function to write reviews
async function writeReviews(shop: string, reviews: any[]) {
  try {
    const filePath = getReviewsPath(shop);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(reviews, null, 2));
  } catch (error) {
    console.error("Error writing reviews:", error);
    throw error;
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { admin, session } = await authenticate.admin(request);
    
    if (!session?.shop) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "5");

    // Validate pagination params
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const allReviews = await readReviews(session.shop);
    const totalReviews = allReviews.length;
    const totalPages = Math.ceil(totalReviews / limit);

    // Calculate start and end indices for the current page
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Get reviews for current page
    const reviews = allReviews.slice(startIndex, endIndex);

    return json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error loading reviews:", error);
    return json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { admin, session } = await authenticate.admin(request);
    
    if (!session?.shop) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const data = await request.json();
    const { name, rating, comment } = data;

    // Validate required fields
    if (!name || !rating || !comment) {
      return json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment.length > 300) {
      return json(
        { error: "Comment must be 300 characters or less" },
        { status: 400 }
      );
    }

    // Read existing reviews
    const reviews = await readReviews(session.shop);

    // Create new review
    const newReview = {
      id: uuidv4(),
      name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    // Add to reviews array
    reviews.unshift(newReview); // Add to beginning to maintain newest first order

    // Save reviews
    await writeReviews(session.shop, reviews);

    return json(newReview, { status: 201 });
  } catch (error) {
    console.error("Error saving review:", error);
    return json(
      { error: "Error saving review" },
      { status: 500 }
    );
  }
} 