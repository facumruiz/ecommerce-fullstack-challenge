import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface SseEvent {
  type: string;
  data: any;
}

@Injectable()
export class InventorySseService {
  private eventSubject = new Subject<SseEvent>();

  emit(event: SseEvent) {
    this.eventSubject.next(event);
  }

  getEvents() {
    return this.eventSubject.asObservable();
  }
}
