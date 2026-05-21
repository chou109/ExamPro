package com.oes.util;

import java.util.HashMap;
import java.util.Map;

public class OperationDescUtil {

    private static final Map<String, String> OPERATION_MAP = new HashMap<>();

    static {
        OPERATION_MAP.put("GET /api/auth/login", "用户登录");
        OPERATION_MAP.put("POST /api/auth/login", "用户登录");
        OPERATION_MAP.put("GET /api/auth/register", "用户注册");
        OPERATION_MAP.put("POST /api/auth/register", "用户注册");
        OPERATION_MAP.put("GET /api/auth/info", "获取用户信息");
        OPERATION_MAP.put("POST /api/auth/changePassword", "修改密码");
        OPERATION_MAP.put("GET /api/users/page", "分页查询用户列表");
        OPERATION_MAP.put("GET /api/users/students", "获取学生列表");
        OPERATION_MAP.put("GET /api/users/teachers", "获取教师列表");
        OPERATION_MAP.put("GET /api/users/{id}", "查看用户详情");
        OPERATION_MAP.put("POST /api/users", "创建用户");
        OPERATION_MAP.put("PUT /api/users", "更新用户信息");
        OPERATION_MAP.put("DELETE /api/users/{id}", "删除用户");
        OPERATION_MAP.put("PUT /api/users/{id}/status", "修改用户状态");
        OPERATION_MAP.put("GET /api/departments/tree", "获取部门树形结构");
        OPERATION_MAP.put("GET /api/departments", "获取部门列表");
        OPERATION_MAP.put("GET /api/departments/{id}", "查看部门详情");
        OPERATION_MAP.put("POST /api/departments", "创建部门");
        OPERATION_MAP.put("PUT /api/departments", "更新部门信息");
        OPERATION_MAP.put("DELETE /api/departments/{id}", "删除部门");
        OPERATION_MAP.put("GET /api/classes/page", "分页查询班级列表");
        OPERATION_MAP.put("GET /api/classes", "获取班级列表");
        OPERATION_MAP.put("GET /api/classes/{id}", "查看班级详情");
        OPERATION_MAP.put("POST /api/class/create", "创建班级");
        OPERATION_MAP.put("PUT /api/classes", "更新班级信息");
        OPERATION_MAP.put("DELETE /api/classes/{id}", "删除班级");
        OPERATION_MAP.put("GET /api/class/my-classes", "获取我的班级");
        OPERATION_MAP.put("POST /api/class/join-by-code", "通过邀请码加入班级");
        OPERATION_MAP.put("GET /api/class/{classId}/members", "获取班级成员列表");
        OPERATION_MAP.put("GET /api/class/{classId}/messages", "获取班级消息列表");
        OPERATION_MAP.put("POST /api/class/{classId}/message", "发送班级消息");
        OPERATION_MAP.put("GET /api/class/{classId}/member/{userId}/check", "检查班级成员角色");
        OPERATION_MAP.put("GET /api/logs/page", "分页查询操作日志");
        OPERATION_MAP.put("GET /api/subjects/page", "分页查询科目列表");
        OPERATION_MAP.put("GET /api/subjects", "获取科目列表");
        OPERATION_MAP.put("GET /api/subjects/{id}", "查看科目详情");
        OPERATION_MAP.put("POST /api/subjects", "创建科目");
        OPERATION_MAP.put("PUT /api/subjects", "更新科目信息");
        OPERATION_MAP.put("DELETE /api/subjects/{id}", "删除科目");
        OPERATION_MAP.put("GET /api/knowledge-points", "获取知识点列表");
        OPERATION_MAP.put("GET /api/knowledge-points/tree", "获取知识点树形结构");
        OPERATION_MAP.put("GET /api/knowledge-points/{id}", "查看知识点详情");
        OPERATION_MAP.put("POST /api/knowledge-points", "创建知识点");
        OPERATION_MAP.put("PUT /api/knowledge-points", "更新知识点信息");
        OPERATION_MAP.put("DELETE /api/knowledge-points/{id}", "删除知识点");
        OPERATION_MAP.put("GET /api/questions/page", "分页查询题目列表");
        OPERATION_MAP.put("GET /api/questions/list", "获取题目列表");
        OPERATION_MAP.put("GET /api/questions/{id}", "查看题目详情");
        OPERATION_MAP.put("POST /api/questions", "创建题目");
        OPERATION_MAP.put("PUT /api/questions", "更新题目信息");
        OPERATION_MAP.put("DELETE /api/questions/{id}", "删除题目");
        OPERATION_MAP.put("GET /api/questions/{id}/correct-rate", "获取题目正确率");
        OPERATION_MAP.put("GET /api/papers/page", "分页查询试卷列表");
        OPERATION_MAP.put("GET /api/papers/{id}", "查看试卷详情");
        OPERATION_MAP.put("GET /api/papers/{id}/questions", "获取试卷题目列表");
        OPERATION_MAP.put("POST /api/papers", "创建试卷");
        OPERATION_MAP.put("PUT /api/papers", "更新试卷信息");
        OPERATION_MAP.put("PUT /api/papers/{id}/publish", "发布试卷");
        OPERATION_MAP.put("DELETE /api/papers/{id}", "删除试卷");
        OPERATION_MAP.put("GET /api/exams/page", "分页查询考试列表");
        OPERATION_MAP.put("GET /api/exams/student/page", "学生分页查询考试列表");
        OPERATION_MAP.put("GET /api/exams/{id}", "查看考试详情");
        OPERATION_MAP.put("POST /api/exams", "创建考试");
        OPERATION_MAP.put("PUT /api/exams", "更新考试信息");
        OPERATION_MAP.put("PUT /api/exams/{id}/publish", "发布考试");
        OPERATION_MAP.put("PUT /api/exams/{id}/start", "开始考试");
        OPERATION_MAP.put("PUT /api/exams/{id}/finish", "结束考试");
        OPERATION_MAP.put("PUT /api/exams/{id}/extend", "延长考试时间");
        OPERATION_MAP.put("DELETE /api/exams/{id}", "删除考试");
        OPERATION_MAP.put("GET /api/exams/{id}/statistics", "获取考试统计信息");
        OPERATION_MAP.put("GET /api/exam-records/page", "分页查询考试记录");
        OPERATION_MAP.put("GET /api/exam-records/{id}", "查看考试记录详情");
        OPERATION_MAP.put("POST /api/exam-records/start", "开始考试作答");
        OPERATION_MAP.put("POST /api/exam-records/answer", "提交考试答案");
        OPERATION_MAP.put("POST /api/exam-records/auto-save", "自动保存答题进度");
        OPERATION_MAP.put("POST /api/exam-records/submit/{id}", "提交考试");
        OPERATION_MAP.put("POST /api/exam-records/screen-switch", "记录切屏次数");
        OPERATION_MAP.put("GET /api/exam-records/{id}/answers", "获取考试答案");
        OPERATION_MAP.put("GET /api/exam-records/student/history", "获取学生考试历史");
        OPERATION_MAP.put("GET /api/exam-records/analysis", "获取考试成绩分析");
        OPERATION_MAP.put("GET /api/exam-records/student/stats", "获取学生考试统计");
        OPERATION_MAP.put("GET /api/wrong-questions/page", "分页查询错题列表");
        OPERATION_MAP.put("GET /api/wrong-questions/{id}", "查看错题详情");
        OPERATION_MAP.put("POST /api/wrong-questions/{id}/practice", "练习错题");
        OPERATION_MAP.put("GET /api/statistics/overview", "获取系统概览统计");
        OPERATION_MAP.put("GET /api/statistics/teacher/stats", "获取教师统计信息");
        OPERATION_MAP.put("POST /api/upload/avatar", "上传用户头像");
    }

    public static String getOperationDesc(String method, String uri) {
        String key = method + " " + uri;
        String desc = OPERATION_MAP.get(key);
        if (desc != null) {
            return desc;
        }
        for (Map.Entry<String, String> entry : OPERATION_MAP.entrySet()) {
            String pattern = entry.getKey();
            if (matchUri(pattern, uri)) {
                return entry.getValue();
            }
        }
        return method + " " + uri;
    }

    private static boolean matchUri(String pattern, String uri) {
        String[] patternParts = pattern.split("/");
        String[] uriParts = uri.split("/");
        if (patternParts.length != uriParts.length) {
            return false;
        }
        for (int i = 0; i < patternParts.length; i++) {
            if (patternParts[i].startsWith("{") && patternParts[i].endsWith("}")) {
                continue;
            }
            if (!patternParts[i].equals(uriParts[i])) {
                return false;
            }
        }
        return true;
    }
}