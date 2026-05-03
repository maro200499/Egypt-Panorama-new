-- Migration: Create activity_reviews table
-- This table stores reviews for individual activities
-- Different from the 'reviews' table which stores reviews for companies

CREATE TABLE IF NOT EXISTS activity_reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    activity_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED,
    rating DECIMAL(2,1) NOT NULL DEFAULT 4.0,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_reviews_activity FOREIGN KEY (activity_id)
        REFERENCES activities(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_activity_reviews_user FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Index for faster queries
CREATE INDEX idx_activity_reviews_activity_id ON activity_reviews(activity_id);
CREATE INDEX idx_activity_reviews_user_id ON activity_reviews(user_id);
CREATE INDEX idx_activity_reviews_created_at ON activity_reviews(created_at DESC);
