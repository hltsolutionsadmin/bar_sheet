import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSizeModalComponent } from './product-size-modal.component';

describe('ProductSizeModalComponent', () => {
  let component: ProductSizeModalComponent;
  let fixture: ComponentFixture<ProductSizeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductSizeModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductSizeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
