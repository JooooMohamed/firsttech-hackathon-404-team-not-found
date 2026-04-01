import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { OffersService } from "./offers.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateOfferDto, UpdateOfferDto } from "../../dto/offer.dto";
import { JoiValidationPipe } from "../../common/joi-validation.pipe";
import { RolesGuard, Roles } from "../../common/roles.guard";

@Controller("offers")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Post()
  @Roles("admin", "staff")
  @UsePipes(new JoiValidationPipe(CreateOfferDto))
  create(@Body() body: any) {
    return this.offersService.create(body);
  }

  @Get("active")
  getActive() {
    return this.offersService.findActive();
  }

  @Get("merchant/:id")
  getByMerchant(@Param("id") id: string) {
    return this.offersService.findByMerchant(id);
  }

  @Get("merchant/:id/active")
  getActiveByMerchant(@Param("id") id: string) {
    return this.offersService.findActiveByMerchant(id);
  }

  @Patch(":id")
  @Roles("admin", "staff")
  update(
    @Param("id") id: string,
    @Body(new JoiValidationPipe(UpdateOfferDto)) body: any,
  ) {
    return this.offersService.update(id, body);
  }

  @Delete(":id")
  @Roles("admin")
  delete(@Param("id") id: string) {
    return this.offersService.delete(id);
  }
}
