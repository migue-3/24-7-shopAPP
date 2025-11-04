import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import {
  Gender,
  Product,
  ProductsResponse,
} from '@products/interfaces/product.interface';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.development';

const baseUrl = environment.baseUrl;

interface Options {
  limit?: number;
  offset?: number;
  gender?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User,
};

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  private productsCache = new Map<string, ProductsResponse>();
  private productCache = new Map<string, Product>();

  getProducts(options: Options): Observable<ProductsResponse> {
    const { limit = 9, offset = 0, gender = '' } = options;

    const key = `${limit}-${offset}-${gender}`; //12-0-''
    if (this.productsCache.has(key)) {
      return of(this.productsCache.get(key)!);
    }

    return this.http
      .get<ProductsResponse>(`${baseUrl}/products`, {
        params: {
          limit: limit,
          offset: offset,
          gender: gender,
        },
      })
      .pipe(
        tap((res) => console.log(res)),
        tap((res) => this.productsCache.set(key, res))
      );
  }

  getProductByIdSlug(idSlug: string): Observable<Product> {
    const key = idSlug;
    if (this.productCache.has(key)) {
      return of(this.productCache.get(key)!);
    }

    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`).pipe(
      tap((resp) => console.log(resp)),
      tap((resp) => this.productCache.set(key, resp))
    );
  }
  getProductById(id: string): Observable<Product> {
    const key = id;

    if (key === 'new') {
      return of(emptyProduct);
    }

    if (this.productCache.has(key)) {
      return of(this.productCache.get(key)!);
    }

    return this.http.get<Product>(`${baseUrl}/products/${id}`).pipe(
      tap((resp) => console.log(resp)),
      tap((resp) => this.productCache.set(key, resp))
    );
  }

  updateProduct(
    id: string,
    productLike: Partial<Product>,
    imageFilesList?: FileList
  ): Observable<Product> {
    const currentImages = productLike.images ?? [];

    return this.uploadImages(imageFilesList).pipe(
      map((imageNames) => ({
        ...productLike,
        images: [...currentImages, ...imageNames],
      })),
      switchMap((updatedProduct) =>
        this.http.patch<Product>(`${baseUrl}/products/${id}`, updatedProduct)
      ),
      tap((product) => this.updateProductCache(product))
    );
    // return this.http
    //   .patch<Product>(`${baseUrl}/products/${id}`, productLike)
    //   .pipe(tap((product) => this.updateProductCache(product)));
  }

  createProduct(
    productLike: Partial<Product>,
    imageFilesList?: FileList
  ): Observable<Product> {
    return this.uploadImages(imageFilesList).pipe(
      map((imageNames) => ({
        ...productLike,
        images: imageNames,
      })),
      switchMap((productNew) =>
        this.http.post<Product>(`${baseUrl}/products`, productNew)
      ),
      tap((product) => this.updateProductCache(product))
    );

    // return this.http
    //   .post<Product>(`${baseUrl}/products`, productLike)
    //   .pipe(tap((product) => this.updateProductCache(product)));
  }

  updateProductCache(product: Product) {
    const productId = product.id;
    const productSlug = product.slug;

    this.productCache.set(productId, product);
    this.productCache.set(productSlug, product);

    this.productsCache.forEach((productsResponse) => {
      productsResponse.products = productsResponse.products.map(
        (currentProduct) => {
          return currentProduct.id === productId ? product : currentProduct;
        }
      );
    });
    console.log('cache actualizado');
  }

  // Tomar un fileList y subirlo
  uploadImages(images?: FileList): Observable<string[]> {
    if (!images) return of([]);

    const uploadObservables = Array.from(images).map((imageFile) =>
      this.uploadImage(imageFile)
    );

    return forkJoin(uploadObservables);
  }

  uploadImage(imageFile: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', imageFile);

    return this.http
      .post<{ fileName: string }>(`${baseUrl}/files/product`, formData)
      .pipe(map((resp) => resp.fileName));
  }
}
