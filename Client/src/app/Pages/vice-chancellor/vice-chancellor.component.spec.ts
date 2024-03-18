import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ViceChancellorComponent } from "./vice-chancellor.component";

describe("ViceChancellorComponent", () => {
  let component: ViceChancellorComponent;
  let fixture: ComponentFixture<ViceChancellorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViceChancellorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViceChancellorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
