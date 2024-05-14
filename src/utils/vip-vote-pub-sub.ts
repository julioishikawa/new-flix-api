type VipVoteMessage = { movieId: string; value: number };
type VipSubscriber = (message: VipVoteMessage) => void;

class VipVotePubSub {
  private channels: Record<string, VipSubscriber[]> = {};

  subscribe(movieId: string, subscriber: VipSubscriber) {
    if (!this.channels[movieId]) {
      this.channels[movieId] = [];
    }

    this.channels[movieId].push(subscriber);
  }

  publish(movieId: string, message: VipVoteMessage) {
    if (!this.channels[movieId]) {
      return;
    }

    for (const subscriber of this.channels[movieId]) {
      subscriber(message);
    }
  }
}

export const movieVipVotePubSub = new VipVotePubSub();
