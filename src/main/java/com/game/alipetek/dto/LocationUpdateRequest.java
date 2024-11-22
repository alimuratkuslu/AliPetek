package com.game.alipetek.dto;

import lombok.Data;

@Data
public class LocationUpdateRequest {
    private String username;
    private Double latitude;
    private Double longitude;
}
