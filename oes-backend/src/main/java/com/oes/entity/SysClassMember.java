package com.oes.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oes.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_class_member")
public class SysClassMember extends BaseEntity {
    private Long classId;
    private Long userId;
    private String role;
    private LocalDateTime muteUntil;
    private LocalDateTime joinedAt;
}