package com.oes.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oes.common.base.BaseEntity;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_class")
public class SysClass extends BaseEntity {
    @JsonProperty("className")
    private String name;
    private String code;
    private Long departmentId;
    private String grade;
    private String inviteCode;
    
    @com.baomidou.mybatisplus.annotation.TableField(exist = false)
    private Integer studentCount;
}
