package com.oes.controller;

import com.oes.common.base.PageResult;
import com.oes.common.base.R;
import com.oes.entity.SysUser;
import com.oes.service.SysUserService;
import com.oes.service.SysLogService;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class SysUserController {

    private static final Logger logger = LoggerFactory.getLogger(SysUserController.class);
    
    private final SysUserService sysUserService;
    private final SysLogService sysLogService;

    public SysUserController(SysUserService sysUserService, SysLogService sysLogService) {
        this.sysUserService = sysUserService;
        this.sysLogService = sysLogService;
        logger.info("========== SysUserController initialized ==========");
        logger.info("sysUserService: {}", sysUserService);
        logger.info("sysLogService: {}", sysLogService);
    }

    @GetMapping("/page")
    public R<PageResult<SysUser>> page(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role) {
        return R.ok(sysUserService.page(current, size, keyword, role));
    }

    @GetMapping("/test-delete")
    public R<String> testDelete(HttpServletRequest request) {
        logger.info("========== TEST DELETE ENDPOINT CALLED ==========");
        logger.info("Request method: {}", request.getMethod());
        logger.info("Request URI: {}", request.getRequestURI());
        
        try {
            logger.info("=== 尝试记录测试日志 ===");
            String username = getUsername(request);
            logger.info("操作用户: {}", username);
            sysLogService.saveLog(username, "测试删除", "GET /api/users/test-delete", 
                    "{\"test\":\"delete\"}", request.getRemoteAddr());
            logger.info("=== 测试日志记录成功 ===");
        } catch (Exception e) {
            logger.error("=== 测试日志记录失败 ===", e);
        }
        
        return R.ok("Test delete endpoint works!");
    }

    @GetMapping("/test")
    public R<String> test() {
        logger.info("========== TEST ENDPOINT CALLED ==========");
        return R.ok("Test endpoint works!");
    }

    @GetMapping("/students")
    public R<List<SysUser>> getStudents() {
        List<SysUser> students = sysUserService.list(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getRole, "STUDENT")
                        .eq(SysUser::getStatus, 1)
                        .orderByAsc(SysUser::getRealName)
        );
        return R.ok(students);
    }

    @GetMapping("/teachers")
    public R<List<SysUser>> getTeachers() {
        List<SysUser> teachers = sysUserService.list(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SysUser>()
                        .eq(SysUser::getRole, "TEACHER")
                        .eq(SysUser::getStatus, 1)
                        .orderByAsc(SysUser::getRealName)
        );
        return R.ok(teachers);
    }

    @GetMapping("/{id}")
    public R<SysUser> getById(@PathVariable Long id) {
        return R.ok(sysUserService.getById(id));
    }

    @PostMapping
    public R<Void> create(@RequestBody SysUser user, HttpServletRequest request) {
        logger.info("========== CREATE USER METHOD CALLED ==========");
        logger.info("User to create: {}", user);
        
        sysUserService.register(user);
        try {
            logger.info("=== 尝试记录创建用户日志 ===");
            String username = getUsername(request);
            logger.info("操作用户: {}", username);
            sysLogService.saveLog(username, "创建用户", "POST /api/users", 
                    "{\"username\":\"" + user.getUsername() + "\",\"realName\":\"" + user.getRealName() + "\"}", 
                    request.getRemoteAddr());
            logger.info("=== 创建用户日志记录成功 ===");
        } catch (Exception e) {
            logger.error("=== 创建用户日志记录失败 ===", e);
        }
        return R.ok();
    }

    @PutMapping
    public R<Void> update(@RequestBody SysUser user, HttpServletRequest request) {
        sysUserService.updateUser(user);
        try {
            String username = getUsername(request);
            sysLogService.saveLog(username, "修改用户", "PUT /api/users", 
                    "{\"id\":\"" + user.getId() + "\",\"username\":\"" + user.getUsername() + "\"}", 
                    request.getRemoteAddr());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        logger.info("========== DELETE USER METHOD CALLED ==========");
        logger.info("User ID to delete: {}", id);
        
        SysUser user = sysUserService.getById(id);
        logger.info("User found: {}", user);
        
        String targetName = user != null ? user.getRealName() : "未知用户";
        logger.info("Target name: {}", targetName);
        
        boolean removed = sysUserService.removeById(id);
        logger.info("Remove result: {}", removed);
        
        try {
            logger.info("=== 尝试记录删除用户日志 ===");
            String username = getUsername(request);
            logger.info("操作用户: {}", username);
            logger.info("sysLogService: {}", sysLogService);
            sysLogService.saveLog(username, "删除用户", "DELETE /api/users/" + id, 
                    "{\"id\":\"" + id + "\",\"target\":\"" + targetName + "\"}", 
                    request.getRemoteAddr());
            logger.info("=== 日志记录成功 ===");
        } catch (Exception e) {
            logger.error("=== 日志记录失败 ===", e);
        }
        return R.ok();
    }

    private String getUsername(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            try {
                String payload = token.split("\\.")[1];
                byte[] decoded = java.util.Base64.getUrlDecoder().decode(payload);
                String json = new String(decoded);
                int start = json.indexOf("\"username\":\"") + 12;
                int end = json.indexOf("\"", start);
                return json.substring(start, end);
            } catch (Exception e) {
                return "anonymous";
            }
        }
        return "anonymous";
    }

    @PutMapping("/{id}/status")
    public R<Void> changeStatus(@PathVariable Long id, @RequestParam Integer status) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setStatus(status);
        sysUserService.updateUser(user);
        return R.ok();
    }
}
