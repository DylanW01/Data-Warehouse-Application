import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FinanceDirectorComponent } from "./finance-director.component";

describe("FinanceDirectorComponent", () => {
  let component: FinanceDirectorComponent;
  let fixture: ComponentFixture<FinanceDirectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FinanceDirectorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceDirectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
