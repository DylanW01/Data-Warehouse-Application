import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChiefLibrarianComponent } from "./chief-librarian.component";

describe("ViceChancellorComponent", () => {
  let component: ChiefLibrarianComponent;
  let fixture: ComponentFixture<ChiefLibrarianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChiefLibrarianComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChiefLibrarianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
