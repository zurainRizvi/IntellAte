export type RSVPSubmission = {
  id?: string;
  name: string;
  response: 'yes' | 'no';
  events: string[];
  guests: number;
  message: string;
  submittedAt: string;
};

export interface RSVPService {
  submit(data: RSVPSubmission): Promise<void>;
  getAll(): RSVPSubmission[];
  hasSubmitted(): boolean;
  getLast(): RSVPSubmission | null;
}

class LocalRSVPService implements RSVPService {
  private key = 'aurora-safar-rsvp';
  private listKey = 'aurora-safar-rsvp-list';

  async submit(data: RSVPSubmission) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
      const existingList = this.getAll();
      const updatedList = [data, ...existingList.filter(item => item.name.toLowerCase() !== data.name.toLowerCase())];
      localStorage.setItem(this.listKey, JSON.stringify(updatedList));
    } catch {
      // fallback
    }
  }

  hasSubmitted() {
    return typeof window !== 'undefined' && Boolean(localStorage.getItem(this.key));
  }

  getLast(): RSVPSubmission | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  getAll(): RSVPSubmission[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.listKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export const rsvpService: RSVPService = new LocalRSVPService();
