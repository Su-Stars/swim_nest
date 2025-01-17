import { Injectable } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { ResponsePayloadDto } from "./dto/response-payload.dto";

@Injectable()
export class AuthService {
  constructor(
    private jwtService : JwtService
  ) {}

  async makeAccessToken(token : string) : Promise<ResponsePayloadDto> {
    const origin = token.replace("Bearer", "");

  }
}
