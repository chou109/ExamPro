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
        return R.ok(sysClassService.page(current, size, keyword, departmentId));
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
    public R<SysClass> create(@RequestBody SysClass sysClass) {
        if (sysClass.getName() == null || sysClass.getName().trim().isEmpty()) {
            return R.error("班级名称不能为空");
        }
        
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
    public R<Void> update(@RequestBody SysClass sysClass) {
        sysClassService.updateById(sysClass);
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
