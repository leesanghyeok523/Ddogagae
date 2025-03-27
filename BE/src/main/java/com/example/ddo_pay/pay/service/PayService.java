package com.example.ddo_pay.pay.service;

import com.example.ddo_pay.pay.dto.request.AccountVerifyRequest;
import com.example.ddo_pay.pay.dto.request.RandomWordRequest;
import org.springframework.stereotype.Service;

@Service
public interface PayService {

    // 계좌 유효 확인 로직
    String verifyAccount(Long userId, AccountVerifyRequest request);

    // 계좌 등록 로직
    void registerAccount(Long userId, RandomWordRequest request);
}
