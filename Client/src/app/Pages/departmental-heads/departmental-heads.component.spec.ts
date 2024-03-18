import { ComponentFixture, TestBed } from "@angular/core/testing";

import { DepartmentalHeadsComponent } from "./departmental-heads.component";

describe("DepartmentalHeadsComponent", () => {
  let component: DepartmentalHeadsComponent;
  let fixture: ComponentFixture<DepartmentalHeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DepartmentalHeadsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentalHeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
