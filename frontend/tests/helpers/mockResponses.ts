export const mockLoginResponse = {
  success: true,
  status: 'success',
  message: 'Logged in',
  data: { token: 'mock-jwt-token', user: { id: 1, email: 'test@example.com', role: 'user' } },
};

export const mockSignupResponse = {
  success: true,
  status: 'success',
  message: 'Signed up',
  data: { id: 2, email: 'new@example.com' },
};

export const mockPlanResponse = {
  plan: [
    { activities: [{ time: '09:00', activity: 'Visit museum' }] },
    { activities: [{ time: '12:00', activity: 'Lunch at local cafe' }] },
    { activities: [{ time: '17:00', activity: 'River cruise' }] },
  ],
  days: [
    { day: 1, title: 'Day 1', activities: [{ time: '09:00', activity: 'Visit museum' }], highlight: 'Museum' },
  ],
  totalCost: 200,
  perNight: 50,
};
