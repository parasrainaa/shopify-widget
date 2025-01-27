import { useState } from "react";
import {
  Card,
  FormLayout,
  TextField,
  Button,
  InlineStack,
  Icon,
  BlockStack,
  Text,
} from "@shopify/polaris";
import { StarFilledIcon, StarIcon } from "@shopify/polaris-icons";

interface ReviewFormProps {
  onSubmit: (review: {
    name: string;
    rating: number;
    comment: string;
  }) => void;
}

export function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const MAX_CHARS = 300;

  const handleSubmit = () => {
    onSubmit({
      name,
      rating,
      comment,
    });
    // Reset form
    setName("");
    setRating(0);
    setComment("");
  };

  const handleCommentChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setComment(value);
    }
  };

  const renderStars = () => {
    return (
      <InlineStack gap="100">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            <Icon
              source={
                star <= (hoveredRating || rating)
                  ? StarFilledIcon
                  : StarIcon
              }
              tone={star <= (hoveredRating || rating) ? "success" : "subdued"}
            />
          </button>
        ))}
      </InlineStack>
    );
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">
          Write a Review
        </Text>
        <FormLayout>
          <TextField
            label="Name"
            value={name}
            onChange={setName}
            autoComplete="off"
            requiredIndicator
          />
          <BlockStack gap="200">
            <Text as="span" variant="bodyMd">
              Rating
            </Text>
            {renderStars()}
          </BlockStack>
          <TextField
            label="Comment"
            value={comment}
            onChange={handleCommentChange}
            multiline={4}
            autoComplete="off"
            requiredIndicator
            maxLength={MAX_CHARS}
          />
          <Text as="span" variant="bodySm" tone="subdued">
            {`${MAX_CHARS - comment.length} characters remaining`}
          </Text>
          <Button variant="primary" onClick={handleSubmit} disabled={!name || !rating || !comment}>
            Submit Review
          </Button>
        </FormLayout>
      </BlockStack>
    </Card>
  );
} 