import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddUpdateMiniatureComponent } from './add-update-miniature.component';

describe('AddUpdateMiniatureComponent', () => {
  let component: AddUpdateMiniatureComponent;
  let fixture: ComponentFixture<AddUpdateMiniatureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUpdateMiniatureComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUpdateMiniatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
