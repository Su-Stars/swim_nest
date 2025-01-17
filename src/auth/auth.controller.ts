import { Body, Controller, Post } from "@nestjs/common";
import { CreateUsersDto } from "./dto/create-users.dto";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }

  @Post("login")
  async login(@Body() createUsersDto : CreateUsersDto) {

  }
}
