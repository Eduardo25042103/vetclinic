import { AppointmentStatusPipe } from './appointment-status.pipe';

describe('AppointmentStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new AppointmentStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
