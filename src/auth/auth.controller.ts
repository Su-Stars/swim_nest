import { Body, Controller, Post } from "@nestjs/common";
import { CreateUsersDto } from "./dto/create-users.dto";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService) {
  }

  @Post("login")
  async login(@Body() createUsersDto : CreateUsersDto) {
  }
}
