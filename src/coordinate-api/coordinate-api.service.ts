import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoordinateApiService {
    constructor(private httpService: HttpService) {}

    async fechData() {
        const key = process.env.KAKAO_KEY
        const headers = {
            'Authorization': key
        }

        console.log(this.httpService.get(
            `https://dapi.kakao.com/v2/local/search/address.JSON?query=${region}`, 
            {headers}
        ))
    }
}
