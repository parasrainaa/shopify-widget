import { useEffect, useState, useCallback } from "react";
import {
  Card,
  Page,
  Layout,
  Text,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
  Badge,
  Icon,
  Banner,
  Pagination,
  Spinner,
} from "@shopify/polaris";
import { StarFilledIcon } from "@shopify/polaris-icons";
import { ReviewForm } from "./ReviewForm";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalReviews: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function ReviewWidget() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [isChangingPage, setIsChangingPage] = useState(false);

  const fetchReviews = useCallback(async (page: number = 1) => {
    try {
      setIsChangingPage(true);
      const response = await fetch(`/api/reviews?page=${page}&limit=5`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (err) {
      setError("Failed to load reviews");
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsChangingPage(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (review: {
    name: string;
    rating: number;
    comment: string;
  }) => {
    try {
      setError(null);
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(review),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      // After successful submission, fetch the first page again
      fetchReviews(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      console.error(err);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Icon
        key={index}
        source={StarFilledIcon}
        tone={index < rating ? "success" : "subdued"}
      />
    ));
  };

  const renderReview = (review: Review) => {
    return (
      <Card key={review.id}>
        <BlockStack gap="200">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">
              {review.name}
            </Text>
            <InlineStack gap="100">
              {renderStars(review.rating)}
              <Badge tone="success">{`${review.rating}/5`}</Badge>
            </InlineStack>
          </InlineStack>
          <Text as="p" variant="bodyMd">
            {review.comment}
          </Text>
          <Text as="span" variant="bodySm" tone="subdued">
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </BlockStack>
      </Card>
    );
  };

  const LoadingState = () => (
    <div style={{ minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <BlockStack gap="400" align="center">
        <Spinner size="large" />
        <Text as="p">{isLoading ? "Loading reviews..." : "Loading page..."}</Text>
      </BlockStack>
    </div>
  );

  return (
    <Page title="Product Reviews">
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {error && (
              <Banner tone="critical">
                <p>{error}</p>
              </Banner>
            )}
            <ReviewForm onSubmit={handleSubmitReview} />
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingLg">
                  All Reviews {pagination.totalReviews > 0 && `(${pagination.totalReviews})`}
                </Text>
                {isLoading || isChangingPage ? (
                  <LoadingState />
                ) : reviews.length === 0 ? (
                  <Box padding="400">
                    <Text as="p">No reviews yet</Text>
                  </Box>
                ) : (
                  <BlockStack gap="400">
                    <Box padding="400">
                      <BlockStack gap="400">
                        {reviews.map((review) => renderReview(review))}
                      </BlockStack>
                    </Box>
                    {pagination.totalPages > 1 && (
                      <Box padding="400">
                        <Pagination
                          hasPrevious={pagination.hasPreviousPage}
                          onPrevious={() => fetchReviews(pagination.currentPage - 1)}
                          hasNext={pagination.hasNextPage}
                          onNext={() => fetchReviews(pagination.currentPage + 1)}
                          label={`Page ${pagination.currentPage} of ${pagination.totalPages}`}
                        />
                      </Box>
                    )}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
} 