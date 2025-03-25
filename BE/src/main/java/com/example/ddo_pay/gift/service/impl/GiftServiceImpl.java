package com.example.ddo_pay.gift.service.impl;

import com.example.ddo_pay.common.exception.CustomException;
import com.example.ddo_pay.common.response.ResponseCode;
import com.example.ddo_pay.gift.dto.GiftCheckResponseDto;
import com.example.ddo_pay.gift.dto.GiftSelectResponseDto;
import com.example.ddo_pay.gift.dto.create.GiftCreateRequestDto;
import com.example.ddo_pay.gift.dto.select.GiftCheckRequestDto;
import com.example.ddo_pay.gift.dto.select.GiftDetailResponseDto;
import com.example.ddo_pay.gift.dto.update.GiftUpdateRequestDto;
import com.example.ddo_pay.gift.entity.Gift;
import com.example.ddo_pay.gift.entity.GiftBox;
import com.example.ddo_pay.gift.entity.USED;
import com.example.ddo_pay.gift.repository.GiftBoxRepository;
import com.example.ddo_pay.gift.repository.GiftRepository;
import com.example.ddo_pay.gift.service.GiftService;
import com.example.ddo_pay.pay.service.PayService;
import com.example.ddo_pay.restaurant.entity.Restaurant;
import com.example.ddo_pay.restaurant.repository.RestaurantRepository;
import com.example.ddo_pay.user.entity.User;
import com.example.ddo_pay.user.service.impl.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GiftServiceImpl implements GiftService {

    private final GiftRepository giftRepository;
    private final GiftBoxRepository giftBoxRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    private final PayService payService;

    /* 맛집 기반으로 기프티콘을 생성할 수 있다. 현재 생성할 때, 같이 이뤄져야 할 결제 로직 빠져있다. */
    @Override
    public void create(GiftCreateRequestDto dto, Long userId) {

        // 1. 맛집의 메뉴들의 정보와 사용자 커스텀 정보를 받아서 DB에 저장한다.

        User user = userRepository.findById(Long.valueOf(userId)).orElseThrow(() -> new CustomException(ResponseCode.NO_EXIST_USER));
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurant().getId()).orElseThrow(() -> new CustomException(ResponseCode.NO_EXIST_RESTAURANT));

        String menuComb = dto.getRestaurant().getMenuDtoList().stream()
                .map(menu -> menu.getMenuName() + "(" + menu.getMenuCount() + "개)")
                .collect(Collectors.joining(", "));



        Gift gift = Gift.builder()
                .title(dto.getGiftTitle())
                .amount(dto.getAmount())
                .message(dto.getMessage())
                .image(dto.getImage())
                .phoneNum(dto.getPhoneNum())
                .menuCombination(menuComb)
                .user(user)
                .restaurant(restaurant)
                .usedStatus(USED.BEFORE_USE)
                .period(LocalDateTime.now().plusMonths(3))
                .build();

        // 기프티콘 저장
        giftRepository.save(gift);

        // 2. 저장된 기프티콘에 대해 받은 기프티콘 목록에 추가하기
        GiftBox giftBox = new GiftBox(user, gift);
        giftBoxRepository.save(giftBox);

        gift.setGiftBox(giftBox);
        giftRepository.save(gift);


        // 3. 맛집 메뉴들의 총액을 계산 후, 결제자의 또페이 잔고에서 출금한다.
        int totalMenuAmount = dto.getRestaurant().getMenuDtoList().stream()
                .mapToInt(menu -> menu.getMenuAmount() * menu.getMenuCount())
                .sum();

        // 해당 유저의 또페이 계정의 잔고에서 출금되는 로직이라고 가정.
//        payService.Withdrawal(user, totalMenuAmount);


    }


    @Override
    public void assignment(GiftUpdateRequestDto dto, Long userId) {
        /* 받은 기프티콘을 다른 사람에게 양도할 수 있다. */
        /* 다른 User가 우리 회원인 경우에는 회원이 알아서 조회해야 하나? */
        Gift gift = giftRepository.findById(dto.getGiftId()).orElseThrow(() -> new CustomException(ResponseCode.NO_EXIST_GIFTICON));

        // GiftBox가 존재하면 해당 엔티티 삭제
        Optional<GiftBox> giftBox = Optional.ofNullable(gift.getGiftBox());
        if(giftBox.isPresent()) {
            giftBoxRepository.delete(gift.getGiftBox());
        }

        // newUser가 있다면 GiftBox 엔티티 생성 후 저장
        Optional<User> optionalNewUser = userRepository.findByPhoneNum(dto.getPhoneNum());
        if(optionalNewUser.isPresent()) {
            GiftBox newGiftBox = new GiftBox(optionalNewUser.get(), gift);
            giftBoxRepository.save(newGiftBox);
        }
    }

    @Override
    public List<GiftSelectResponseDto> selectMyList(Long userId) {
        User findUser = userRepository.findById(userId).orElseThrow(() -> new CustomException(ResponseCode.NO_EXIST_USER));
        List<Gift> findList = giftRepository.findByUser(findUser);
        List<GiftSelectResponseDto> dtoList = new ArrayList<>();

        for (Gift gift : findList) {
            GiftSelectResponseDto dto = GiftSelectResponseDto.from(gift);
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    public GiftDetailResponseDto selectDetail(int giftId) {
        return null;
    }

    @Override
    public GiftCheckResponseDto usedCheck(GiftCheckRequestDto dto) {
        return null;
    }
}
