import { Component, inject } from '@angular/core';
import { ProductsService } from '@products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductsCarouselComponent } from '../../../products/components/products-carousel/products-carousel.component';

@Component({
  selector: 'app-product-page',
  imports: [ProductsCarouselComponent],
  templateUrl: './product-page.component.html',
})
export class ProductPageComponent {
  productService = inject(ProductsService);
  activatedRoute = inject(ActivatedRoute);

  // Tomamos el idSulg de la ruta activa
  productIdSlug = this.activatedRoute.snapshot.params['idSlug'];

  productResource = rxResource({
    request: () => ({ idSlug: this.productIdSlug }),
    loader: ({ request }) =>
      this.productService.getProductByIdSlug(request.idSlug),
  });
}
