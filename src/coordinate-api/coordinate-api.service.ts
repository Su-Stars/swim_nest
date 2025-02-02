import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CoordinateApiService {
  constructor(private httpService: HttpService) {}

  async fechData(address) {
    const key = process.env.KAKAO_KEY;
    const headers = {
      Authorization: key,
    };

    const response = await lastValueFrom(
      this.httpService.get(
        `https://dapi.kakao.com/v2/local/search/address.JSON?query=${address}`,
        { headers },
      ),
    );
    if (!response.data.documents.length) {
      throw new HttpException({
          status : "fail",
          message : "입력하신 주소는 어떠한 장소에도 해당되지 않습니다."
      }, HttpStatus.NOT_FOUND)
    }

    const { x: longitude, y: latitude } = response.data.documents[0].address;

    return { longitude, latitude };
  }
}
