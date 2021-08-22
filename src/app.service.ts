import { HttpService, HttpStatus, Injectable } from '@nestjs/common';

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

  private static getDecimals(price): number {
    let decimals: any = 0;
    if (price.toString().indexOf('.') !== (-1)) {
      decimals = price.toString();
      decimals = decimals.split('.')[1].length;
    }
    return decimals;
  }

  /**
   * Return four products
   * @param keyword word to search
   */
  async searchItems(keyword: string): Promise<any> {

    // get all items
    const result = await this.http.get(`${this.baseUrl}/sites/MLA/search?q=${keyword}`,{}).toPromise().then( async res => {
      return res.data;
    });

    if(!result.results.length) {
      return {statusCode: HttpStatus.OK, data:{
          author: {
            name: this.authorName,
            lastname: this.authorLastName
          },
          categories: [],
          data: [],
        }};
    }

    let categories: any;
    if(result.available_filters.length) {
      categories = result.available_filters.find(category => category.id === 'category');
    }
    if(result.filters.length) {
      categories = result.filters.find(category => category.id === 'category');
    }

    let breadcrumbs = [];
    if (categories.values.length) {
      if(categories.values[0].path_from_root && categories.values[0].path_from_root.length){
        for (const cat of categories.values[0].path_from_root) {
          breadcrumbs.push(cat.name);
        }
      } else {
        let cont = 0;
        for (const cat of categories.values) {
          if (cat.results > cont) {
            cont = cat.results;
          }
        }
        breadcrumbs = categories.values.find(cat => cat.results === cont).name;
      }
    }


    const items = result.results.map((item, index) => {

      if (index < 4) {
        const decimals: number = AppService.getDecimals(item.price);

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
    return {statusCode: HttpStatus.OK, data:{
        author: {
          name: this.authorName,
          lastname: this.authorLastName
        },
        categories: breadcrumbs,
        data: items,
      }};
  }

  /**
   * return a specific detail product
   * @param idItem id of product
   */
  async detailItem(idItem: string): Promise<any> {

    try {
      // get detail item
      let item = await this.http.get(`${this.baseUrl}/items/${idItem}`,{}).toPromise().then( async res => {
        return res.data;
      });

      // get description item
      const resultDescription = await this.http.get(`${this.baseUrl}/items/${idItem}/description`,{}).toPromise().then( async res => {
        return res.data;
      });


      if(item.status === HttpStatus.NOT_FOUND || resultDescription.status === HttpStatus.NOT_FOUND) {
        return {statusCode: HttpStatus.NOT_FOUND, data:{
            author: {
              name: this.authorName,
              lastname: this.authorLastName
            },
            item: null,
            error: 'resource not found'
          }};
      }

      const decimals: number = AppService.getDecimals(item.price);

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

      return {statusCode: HttpStatus.NOT_FOUND, data:{
          author: {
            name: this.authorName,
            lastname: this.authorLastName
          },
          item
        }};
    } catch (e) {
      return {statusCode: HttpStatus.NOT_FOUND, data:{
          author: {
            name: this.authorName,
            lastname: this.authorLastName
          },
          item: null,
          error: e.response.data.error
        }};
    }

  }

}
