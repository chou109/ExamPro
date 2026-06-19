package com.oes.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.oes.common.base.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_class")
public class SysClass extends BaseEntity {
    private String name;
    private String code;
    private Long departmentId;
    private String grade;
    private String inviteCode;
    
    @com.baomidou.mybatisplus.annotation.TableField(exist = false)
    private Integer studentCount;
    
    // 添加 className 属性用于前端交互
    @com.baomidou.mybatisplus.annotation.TableField(exist = false)
    private String className;
    
    // 让 Jackson 在反序列化时能正确设置 name 字段
    public void setClassName(String className) {
        this.name = className;
    }
    
    // 让 Jackson 在序列化时能正确返回 className
    public String getClassName() {
        return this.name;
    }
}
