import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SensorsPage } from './sensors.page';

describe('SensorsPage', () => {
  let component: SensorsPage;
  let fixture: ComponentFixture<SensorsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
