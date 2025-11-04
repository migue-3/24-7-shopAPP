import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  viewChild,
  effect,
} from '@angular/core';
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';

@Component({
  selector: 'products-carousel',
  imports: [ProductImagePipe],
  templateUrl: './products-carousel.component.html',
  styles: `
    .swiper{
      width: 100%;
      height: 500px;
    }
  `,
})
export class ProductsCarouselComponent implements AfterViewInit {
  images = input.required<string[]>();
  swiperDiv = viewChild.required<ElementRef>('swiperDiv');

  swiper: Swiper | undefined = undefined;
  private isInitialized = false;

  constructor() {
    // Detectar cambios en las imágenes
    effect(() => {
      const currentImages = this.images();

      // Solo actualizar después de la inicialización
      if (this.isInitialized && this.swiper) {
        setTimeout(() => {
          this.swiper?.destroy(true, true);
          this.swiperInit();
        }, 100);
      }
    });
  }

  ngAfterViewInit(): void {
    this.swiperInit();
    this.isInitialized = true;
  }

  swiperInit() {
    const element = this.swiperDiv().nativeElement;
    if (!element) return;

    this.swiper = new Swiper(element, {
      direction: 'horizontal',
      loop: this.images().length > 1,
      modules: [Navigation, Pagination],

      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },

      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      scrollbar: {
        el: '.swiper-scrollbar',
      },

      // Estas opciones ayudan a detectar cambios
      observer: true,
      observeParents: true,
    });
  }
}
