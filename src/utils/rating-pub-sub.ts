type RatingMessage = { movieId: string; rating: number };
type RatingSubscriber = (message: RatingMessage) => void;

class RatingPubSub {
  private channels: Record<string, RatingSubscriber[]> = {};

  subscribe(movieId: string, subscriber: RatingSubscriber) {
    if (!this.channels[movieId]) {
      this.channels[movieId] = [];
    }

    this.channels[movieId].push(subscriber);
  }

  publish(movieId: string, message: RatingMessage) {
    if (!this.channels[movieId]) {
      return;
    }

    for (const subscriber of this.channels[movieId]) {
      subscriber(message);
    }
  }
}

export const movieRatingPubSub = new RatingPubSub();
