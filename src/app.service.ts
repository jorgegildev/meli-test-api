import { HttpService, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  baseUrl: string;
  authorName: string;
  authorLastName: string;

  constructor(private http: HttpService) {
    this.baseUrl = 'https://api.mercadolibre.com';
    this.authorName = 'Jorge Eduardo';
    this.authorLastName = 'Gil Roa';
  }

  private getDecimals(price): number {
    let decimals: any = 0;
    if (price.toString().indexOf('.') !== (-1)) {
      decimals = price.toString();
      decimals = decimals.split('.')[1].length;
    }
    return decimals;
  }

  async searchItems(q: string): Promise<any> {

    // get all items
    const result = await this.http.get(`${this.baseUrl}/sites/MLA/search?q=${q}`,{}).toPromise().then( async result => {
      return result.data;
    });

    const categories: [] = result.available_filters.find(categroy => categroy.id === 'category').values;

    const items = result.results.map((item, index) => {

      if (index < 4) {
        const decimals: number = this.getDecimals(item.price);

        return {
          id: item.id,
          title: item.title,
          price: {
            currency: item.currency_id,
            amount: item.price,
            decimals
          },
          picture: item.thumbnail,
          condition: item.condition,
          // eslint-disable-next-line @typescript-eslint/camelcase
          free_shipping: item.shipping.free_shipping
        }
      }

    }).filter((item) => {
      return item;
    });

    // return response
    return {
      author: {
        name: this.authorName,
        lastname: this.authorLastName
      },
      categories,
      data: items,
    };
  }

  async detailItem(idItem: string): Promise<any> {

    // get detail item
    let item = await this.http.get(`${this.baseUrl}/items/${idItem}`,{}).toPromise().then( async result => {
      return result.data;
    });

    // get description item
    const resultDescription = await this.http.get(`${this.baseUrl}/items/${idItem}/description`,{}).toPromise().then( async result => {
      return result.data;
    });

    const decimals: number = this.getDecimals(item.price);

    item = {
      id: item.id,
      title: item.title,
      price: {
        currency: item.currency_id,
        amount: item.price,
        decimals
      },
      picture: item.pictures[0].url,
      condition: item.condition,
      // eslint-disable-next-line @typescript-eslint/camelcase
      free_shipping: item.shipping.free_shipping,
      // eslint-disable-next-line @typescript-eslint/camelcase
      sold_quantity: item.sold_quantity,
      description: resultDescription.plain_text,
    }

    return {
      author: {
        name: this.authorName,
        lastname: this.authorLastName
      },
      item
    }
  }

}
