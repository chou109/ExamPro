package com.oes.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.oes.entity.SysDepartment;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysDepartmentMapper extends BaseMapper<SysDepartment> {

    @Select("SELECT COALESCE(MAX(sort_order), 0) FROM sys_department")
    Integer selectMaxSortOrder();
}
