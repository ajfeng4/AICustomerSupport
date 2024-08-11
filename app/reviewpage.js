import { useState } from 'react';

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.trim()) {
      alert('Please enter a review.');
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newReview }),
      });

      if (response.ok) {
        const addedReview = await response.json();
        setReviews([...reviews, addedReview]);
        setNewReview('');

        // Display the popup with the review content
        window.alert(`Review Submitted: ${addedReview.content}`);
      } else {
        console.error('Failed to submit review.');
      }
    } catch (error) {
      console.error('An error occurred while submitting the review:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>AI Review Page</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <textarea
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          placeholder="Write your review here..."
          rows="5"
          style={{ width: '100%', padding: '10px' }}
        ></textarea>
        <button type="submit" style={{ marginTop: '10px', padding: '10px' }}>
          Submit Review
        </button>
      </form>

      <h2>Reviews</h2>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {reviews.map((review, index) => (
          <li key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            {review.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
