package com.oes.controller;

import com.oes.common.base.PageResult;
import com.oes.common.base.R;
import com.oes.entity.SysClass;
import com.oes.service.SysClassService;
import com.oes.service.SysClassMemberService;
import com.oes.service.SysClassMessageService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classes")
public class SysClassController {

    private final SysClassService sysClassService;
    private final SysClassMemberService classMemberService;
    private final SysClassMessageService classMessageService;

    public SysClassController(SysClassService sysClassService, 
                             SysClassMemberService classMemberService,
                             SysClassMessageService classMessageService) {
        this.sysClassService = sysClassService;
        this.classMemberService = classMemberService;
        this.classMessageService = classMessageService;
    }

    @GetMapping("/page")
    public R<PageResult<SysClass>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId) {
        PageResult<SysClass> result = sysClassService.page(current, size, keyword, departmentId);
        
        // 填充每个班级的学生人数
        for (SysClass cls : result.getRecords()) {
            List<com.oes.entity.SysClassMember> members = classMemberService.getMembersByClassId(cls.getId());
            // 只统计学生（MEMBER）数量，不包括教师（OWNER/ADMIN）
            int studentCount = (int) members.stream()
                    .filter(m -> "MEMBER".equals(m.getRole()))
                    .count();
            cls.setStudentCount(studentCount);
        }
        
        return R.ok(result);
    }

    @GetMapping
    public R<List<SysClass>> list(@RequestParam(required = false) Long departmentId) {
        return R.ok(sysClassService.listByDepartmentId(departmentId));
    }

    @GetMapping("/{id}")
    public R<SysClass> getById(@PathVariable Long id) {
        return R.ok(sysClassService.getById(id));
    }

    @GetMapping("/by-invite-code")
    public R<SysClass> getByInviteCode(@RequestParam String inviteCode) {
        SysClass sysClass = sysClassService.getByInviteCode(inviteCode);
        if (sysClass == null) {
            return R.error("班级不存在");
        }
        return R.ok(sysClass);
    }

    @PostMapping
    public R<SysClass> create(@RequestBody Map<String, Object> request) {
        // 手动处理字段映射
        String className = (String) request.get("className");
        if (className == null || className.trim().isEmpty()) {
            return R.error("班级名称不能为空");
        }
        
        SysClass sysClass = new SysClass();
        sysClass.setName(className);
        sysClass.setCode((String) request.get("code"));
        
        if (request.get("departmentId") != null) {
            sysClass.setDepartmentId(Long.parseLong(request.get("departmentId").toString()));
        }
        sysClass.setGrade((String) request.get("grade"));
        
        String inviteCode = generateInviteCode();
        sysClass.setInviteCode(inviteCode);
        
        if (sysClass.getCode() == null || sysClass.getCode().trim().isEmpty()) {
            sysClass.setCode(inviteCode);
        }
        
        sysClassService.save(sysClass);
        return R.ok(sysClass);
    }

    private String generateInviteCode() {
        int length = 5 + (int)(Math.random() * 4);
        int code = (int)(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1)));
        return String.valueOf(code);
    }

    @PutMapping
    public R<Void> update(@RequestBody Map<String, Object> request) {
        if (request.get("id") == null) {
            return R.error("ID 不能为空");
        }
        
        Long id = Long.parseLong(request.get("id").toString());
        // 先查询原有数据
        SysClass existing = sysClassService.getById(id);
        if (existing == null) {
            return R.error("班级不存在");
        }
        
        // 更新字段（支持 className 字段）
        String className = (String) request.get("className");
        if (className != null && !className.trim().isEmpty()) {
            existing.setName(className);
        }
        
        String name = (String) request.get("name");
        if (name != null && !name.trim().isEmpty()) {
            existing.setName(name);
        }
        
        String code = (String) request.get("code");
        if (code != null) {
            existing.setCode(code);
        }
        
        if (request.get("departmentId") != null) {
            existing.setDepartmentId(Long.parseLong(request.get("departmentId").toString()));
        }
        
        String grade = (String) request.get("grade");
        if (grade != null) {
            existing.setGrade(grade);
        }
        
        sysClassService.updateById(existing);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public R<Void> delete(@PathVariable Long id) {
        classMessageService.deleteByClassId(id);
        classMemberService.removeByClassId(id);
        sysClassService.removeById(id);
        return R.ok();
    }
}
