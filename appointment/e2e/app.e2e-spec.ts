import { AppointmentPage } from './app.po';

describe('appointment App', () => {
  let page: AppointmentPage;

  beforeEach(() => {
    page = new AppointmentPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
