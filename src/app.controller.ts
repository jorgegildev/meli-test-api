import { Controller, Get, Query, Res, HttpStatus, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('items')
export class AppController {

  result: any;
  constructor(private readonly appService: AppService) {}

  @Get()
  async searchItems(@Query() query, @Res() res): Promise<any> {
    this.result = await this.appService.searchItems(query.search);
    return res.status(this.result.statusCode).json(this.result.data);
  }

  @Get('/:itemId')
  async detailItem(@Param('itemId') itemId: string, @Res() res): Promise<any> {
    this.result = await this.appService.detailItem(itemId);
    return res.status(this.result.statusCode).json(this.result.data);
  }

}
