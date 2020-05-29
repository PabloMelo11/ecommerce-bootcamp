import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = this.ormRepository.findOne({
      where: { name },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsId = products.map(product => product.id);
    const productList = await this.ormRepository.find({ id: In(productsId) });

    return productList;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsItems = await this.findAllById(products);

    const updateProducts = productsItems.map(productItem => {
      const productFound = products.find(
        product => product.id === productItem.id,
      );

      const updateProduct = productItem;

      if (!productFound) {
        return productItem;
      }

      updateProduct.quantity -= productFound.quantity;

      return updateProduct;
    });

    await this.ormRepository.save(updateProducts);

    return updateProducts;
  }
}

export default ProductsRepository;
