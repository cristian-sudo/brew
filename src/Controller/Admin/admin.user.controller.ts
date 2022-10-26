import {
  ClassSerializerInterceptor,
  Controller, Get, Param, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import AdminHandler from '../../Service/Handler/Admin/admin.handler';

@ApiTags('Admin/User')
@ApiBearerAuth('defaultBearerAuth')
@Controller('api/admin/user')
export default class AdminUserController {
  constructor(private adminHandler: AdminHandler) {
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @UseGuards(AuthGuard('admin'))
  @Get('/changeStatus/:name/:id')
  async changeStatus(@Param('name') name:string, @Param('id') id: number) {
    return this.adminHandler.changeStatus(name, id);
  }
}
