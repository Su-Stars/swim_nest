import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./users.entity";
import { Repository } from "typeorm";
import { JwtPayload } from "../auth/dto/jwt-payload";
import { EditUserInfoDto } from "./dto/editUserInfo.dto";
import { MyReviewQueryDto } from "./dto/myReviewQuery.dto";
import { ImagesService } from "../images/images.service";
import { UserImages } from "./user-images.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepository : Repository<Users>,
    @InjectRepository(UserImages) private userImagesRepository : Repository<UserImages>,
    private readonly imagesService : ImagesService,
  ) {}

  async getMyReviews(user_id : number, query : MyReviewQueryDto) {
    const userAndReviews = await this.usersRepository.findOne({
      where : {
        id : user_id
      },
      relations : {
        reviews : {
          review_keywords : {
            keyword : true
          }
        },
      },
    });



    const exceptUserCriticalInfo = {
      userId : userAndReviews.id,
      total : userAndReviews.reviews.length,
      page : query.page,
      limit : query.limit,
      reviews : userAndReviews.reviews.map((review) => ({
        ...review,
        review_keywords : review.review_keywords.map((keyword) => {
          return keyword.keyword.keyword; // 어지럽다 ㅋㅋㅋㅋㅋ
        })
      }))
    }

    return {
      status : "success",
      message : userAndReviews.reviews.length === 0 ? "사용자가 작성한 리뷰가 없습니다." : "내 리뷰 목록 조회 성공",
      data : exceptUserCriticalInfo
    }
  }

  async getMyInfo(jwtPayload : JwtPayload) {
    const {id, role} : JwtPayload = jwtPayload;

    // 이거 수영장 정보랑 연동되면 수정해야함 - 릴레이션으로
    const users = await this.usersRepository.findOne({
      where : {
        id : id,
      },
      relations : {
        userImage : {
          image : true
        }
      },
    });


    const {password, salt, refresh_token, expiration_date,  ...result} = users;

    if(result.userImage) {
      return {
        ...result,
        userImage : result.userImage.image.url
      }
    } else {
      return result;
    }
  }

  async editMyInfo(id : number, editInfo : EditUserInfoDto) {

    // 만약 요청 객체에 어떠한 사항도 담겨있지 않다면, (editObj) 에 어떠한 정보도 없음을 가정 - 수정해야함
    if(!editInfo) {
      throw new HttpException(
        {
          status : "fail",
          message : "변경할 사항이 없습니다."
        },
        HttpStatus.NOT_ACCEPTABLE
      )
    }

    const editObj = {};

    if(editInfo.nickname)
      editObj["nickname"] = editInfo.nickname;

    if(editInfo.description)
      editObj["description"] = editInfo.description;

    if(editInfo.role)
      editObj["role"] = editInfo.role;



    const updateResult = await this.usersRepository.update({
      id : id
    }, editObj);


    return updateResult;
  }

  async deleteMyAccount(id : number) {

    const result = await this.usersRepository.delete({id : id});

    // 만약 삭제되지 않았다면 - 이는 해당 id 를 가진 유저가 데이터베이스에 없음을 의미한다.
    if(result.affected === 0){
      throw new HttpException({
        status : "fail",
        message : "해당 유저는 이미 존재하지 않습니다."
      }, HttpStatus.NOT_FOUND)
    }

    return result;
  }

  async registerMyImage(id : number, file : Express.Multer.File) {
    const isAlreadyExist = await this.userImagesRepository.exists({
      where : {
        user_id : id
      }
    })

    if(isAlreadyExist) {
      throw new HttpException({
        status : "fail",
        message : "사용자 이미지를 이미 등록하셨습니다."
      }, HttpStatus.BAD_REQUEST);
    }

    // 파일을 업로드 할 때, 파일의 이름과 id 를 조합하여 url 을 생성함.
    // 반환값으로는, 입력된 images 레이블의 PK 를 반환한다. - identifiers
    const {identifiers} = await this.imagesService.uploadImages(file, id);

    // images 테이블에 저장된 PK
    const image_id = identifiers[0].id;

    // 이미지 테이블에 저장된 이미지 id, 유저의 id 를 조합하여 UserImages 엔티티로 저장. (user_images 테이블)
    const result : UserImages = await this.userImagesRepository.save({
      user_id : id,
      image_id : image_id
    })

    if(!result) {
      throw new HttpException({
        status : "error",
        message : "유저의 이미지가 저장되지 않았습니다."
      }, HttpStatus.NOT_ACCEPTABLE)
    }

    return {
      status : "success",
      message : "유저 이미지 등록이 성공했습니다."
    }
  }

  async patchMyImage(id : number, file : Express.Multer.File) {
    // 1. UserImages 의 나의 image_id 를 검색하고, Images 에서 해당 id 를 삭제한다. - 자동으로 user_images 레코드 삭제

    const userImage : UserImages = await this.userImagesRepository.findOne({
      where : {
        user_id : id
      }
    });

    // 현재 등록된 이미지가 없다면
    if(!userImage) {
      throw new HttpException({
        status : "fail",
        message : "사용자는 이미지를 등록 한 적이 없습니다."
      }, HttpStatus.NOT_FOUND);
    }

    const deleteSuccess = await this.imagesService.deleteImage(userImage.image_id);

    // s3 버킷에서 삭제하는 데 실패했다면.
    if(!deleteSuccess) {
      throw new HttpException({
        status : "error",
        message : "s3 버킷의 이미지를 삭제하는 데 실패했습니다."
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // images 레이블과 함께 user_images 레이블이 삭제됨. - 자동

    // 이후, 메서드 재사용
    return await this.registerMyImage(id, file);

  }

  async deleteMyImage(id : number) {
    // 1. UserImages 의 나의 image_id 를 검색하고, Images 에서 해당 id 를 삭제한다. - 자동으로 user_images 레코드 삭제
    const userImage = await this.userImagesRepository.findOne({
      where : {
        user_id : id
      }
    });

    // 현재 등록된 이미지가 없다면
    if(!userImage) {
      throw new HttpException({
        status : "fail",
        message : "사용자는 이미지를 등록 한 적이 없습니다."
      }, HttpStatus.NOT_FOUND);
    }

    const deleteSuccess = await this.imagesService.deleteImage(userImage.image_id);

    // s3 버킷에서 삭제하는 데 실패했다면.
    if(!deleteSuccess) {
      throw new HttpException({
        status : "error",
        message : "s3 버킷의 이미지를 삭제하는 데 실패했습니다."
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 2. 성공시 응답 반환
    return {
      status : "success",
      message : "성공적으로 삭제되었습니다."
    }
  }
}
