package com.oes.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oes.entity.SysClassMember;
import com.oes.entity.SysClass;
import com.oes.entity.SysUser;
import com.oes.mapper.SysClassMemberMapper;
import com.oes.common.base.R;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SysClassMemberService extends ServiceImpl<SysClassMemberMapper, SysClassMember> {

    private final SysClassService sysClassService;
    private final SysUserService sysUserService;

    public SysClassMemberService(SysClassService sysClassService, SysUserService sysUserService) {
        this.sysClassService = sysClassService;
        this.sysUserService = sysUserService;
    }

    public List<SysClassMember> getMembersByClassId(Long classId) {
        return list(new LambdaQueryWrapper<SysClassMember>()
                .eq(SysClassMember::getClassId, classId)
                .orderByAsc(SysClassMember::getRole));
    }

    public SysClassMember getMember(Long classId, Long userId) {
        return getOne(new LambdaQueryWrapper<SysClassMember>()
                .eq(SysClassMember::getClassId, classId)
                .eq(SysClassMember::getUserId, userId));
    }

    public boolean isMember(Long classId, Long userId) {
        return count(new LambdaQueryWrapper<SysClassMember>()
                .eq(SysClassMember::getClassId, classId)
                .eq(SysClassMember::getUserId, userId)) > 0;
    }

    public boolean isOwner(Long classId, Long userId) {
        return count(new LambdaQueryWrapper<SysClassMember>()
                .eq(SysClassMember::getClassId, classId)
                .eq(SysClassMember::getUserId, userId)
                .eq(SysClassMember::getRole, "OWNER")) > 0;
    }

    public boolean isAdmin(Long classId, Long userId) {
        return count(new LambdaQueryWrapper<SysClassMember>()
                .eq(SysClassMember::getClassId, classId)
                .eq(SysClassMember::getUserId, userId)
                .in(SysClassMember::getRole, "OWNER", "ADMIN")) > 0;
    }

    @Transactional
    public void addMember(Long classId, Long userId, String role) {
        SysClassMember member = new SysClassMember();
        member.setClassId(classId);
        member.setUserId(userId);
        member.setRole(role);
        member.setJoinedAt(LocalDateTime.now());
        save(member);
    }

    @Transactional
    public void removeMember(Long classId, Long userId) {
        remove(new LambdaQueryWrapper<SysClassMember>()
                .eq(SysClassMember::getClassId, classId)
                .eq(SysClassMember::getUserId, userId));
    }

    @Transactional
    public void updateRole(Long classId, Long userId, String role) {
        SysClassMember member = getMember(classId, userId);
        if (member != null) {
            member.setRole(role);
            updateById(member);
        }
    }

    @Transactional
    public void muteMember(Long classId, Long userId, Integer minutes) {
        SysClassMember member = getMember(classId, userId);
        if (member != null) {
            member.setMuteUntil(minutes > 0 ? LocalDateTime.now().plusMinutes(minutes) : null);
            updateById(member);
        }
    }

    @Transactional
    public void muteAllMembers(Long classId, Integer minutes) {
        List<SysClassMember> members = getMembersByClassId(classId);
        LocalDateTime muteUntil = minutes > 0 ? LocalDateTime.now().plusMinutes(minutes) : null;
        for (SysClassMember member : members) {
            member.setMuteUntil(muteUntil);
            updateById(member);
        }
    }

    public boolean isMuted(Long classId, Long userId) {
        SysClassMember member = getMember(classId, userId);
        if (member == null) {
            return true;
        }
        return member.getMuteUntil() != null && member.getMuteUntil().isAfter(LocalDateTime.now());
    }

    public List<SysClassMember> getMemberByUserId(Long userId) {
        return list(new LambdaQueryWrapper<SysClassMember>()
                .eq(SysClassMember::getUserId, userId));
    }

    @Transactional
    public void removeByClassId(Long classId) {
        remove(new LambdaQueryWrapper<SysClassMember>()
                .eq(SysClassMember::getClassId, classId));
    }
}