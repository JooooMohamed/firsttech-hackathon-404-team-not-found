import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UsePipes,
  BadRequestException,
} from "@nestjs/common";
import { MerchantsService } from "./merchants.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateMerchantDto, UpdateMerchantDto } from "../../dto/merchant.dto";
import { JoiValidationPipe } from "../../common/joi-validation.pipe";
import { RolesGuard, Roles } from "../../common/roles.guard";

@Controller("merchants")
export class MerchantsController {
  constructor(private merchantsService: MerchantsService) {}

  @Get()
  findAll() {
    return this.merchantsService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.merchantsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Request() req: any,
    @Body(new JoiValidationPipe(CreateMerchantDto)) body: any,
  ) {
    return this.merchantsService.create(req.user._id, body);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "staff")
  update(
    @Request() req: any,
    @Param("id") id: string,
    @Body(new JoiValidationPipe(UpdateMerchantDto)) body: any,
  ) {
    return this.merchantsService.update(id, body, req.user);
  }

  // C1: Self-service merchant onboarding
  @Post("register")
  @UseGuards(JwtAuthGuard)
  registerMerchant(
    @Request() req: any,
    @Body(new JoiValidationPipe(CreateMerchantDto)) body: any,
  ) {
    return this.merchantsService.registerMerchant(req.user._id, body);
  }

  // I4: Staff management
  @Get(":id/staff")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "staff")
  getStaff(@Param("id") id: string) {
    return this.merchantsService.getStaff(id);
  }

  @Post(":id/staff")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "staff")
  addStaff(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { email: string },
  ) {
    if (
      !body.email ||
      typeof body.email !== "string" ||
      !body.email.includes("@")
    ) {
      throw new BadRequestException("Valid email is required");
    }
    return this.merchantsService.addStaff(id, req.user._id, body.email.trim());
  }

  @Delete(":id/staff/:userId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "staff")
  removeStaff(
    @Param("id") id: string,
    @Param("userId") userId: string,
    @Request() req: any,
  ) {
    return this.merchantsService.removeStaff(id, req.user._id, userId);
  }
}
