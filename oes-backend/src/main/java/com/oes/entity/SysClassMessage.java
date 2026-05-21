package com.oes.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oes.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_class_message")
public class SysClassMessage extends BaseEntity {
    private Long classId;
    private Long senderId;
    private String content;
    private String type;
    private String fileUrl;
}