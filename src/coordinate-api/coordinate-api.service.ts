import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CoordinateApiService {
    constructor(private httpService: HttpService) {}

    async fechData(address) {
        const key = process.env.KAKAO_KEY
        const headers = {
            'Authorization': key
        }

        const response = await lastValueFrom(
        this.httpService.get(
            `https://dapi.kakao.com/v2/local/search/address.JSON?query=${address}`, 
            {headers}
        )
    );
        if (!response.data.documents.length) {
            throw new NotFoundException("주소를 찾을 수 없습니다.")
        }

    const {x : longitude, y : latitude} = response.data.documents[0].address
    
    return {longitude, latitude}
    }
}
