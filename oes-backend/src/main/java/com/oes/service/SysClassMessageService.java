package com.oes.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.oes.common.base.PageResult;
import com.oes.entity.SysClassMessage;
import com.oes.mapper.SysClassMessageMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SysClassMessageService extends ServiceImpl<SysClassMessageMapper, SysClassMessage> {

    public PageResult<SysClassMessage> getMessagesByClassId(Long classId, Integer current, Integer size) {
        Page<SysClassMessage> page = new Page<>(current, size);
        LambdaQueryWrapper<SysClassMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysClassMessage::getClassId, classId)
                .orderByDesc(SysClassMessage::getCreateTime);
        IPage<SysClassMessage> result = page(page, wrapper);
        return new PageResult<>(result.getTotal(), result.getRecords(), (long) current, (long) size);
    }

    @Transactional
    public SysClassMessage sendMessage(Long classId, Long senderId, String content, String type, String fileUrl) {
        SysClassMessage message = new SysClassMessage();
        message.setClassId(classId);
        message.setSenderId(senderId);
        message.setContent(content);
        message.setType(type != null ? type : "TEXT");
        message.setFileUrl(fileUrl);
        save(message);
        return message;
    }

    public List<SysClassMessage> getRecentMessages(Long classId, Integer limit) {
        Page<SysClassMessage> page = new Page<>(1, limit);
        LambdaQueryWrapper<SysClassMessage> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysClassMessage::getClassId, classId)
                .orderByDesc(SysClassMessage::getCreateTime);
        return page(page, wrapper).getRecords();
    }

    @Transactional
    public void deleteByClassId(Long classId) {
        remove(new LambdaQueryWrapper<SysClassMessage>()
                .eq(SysClassMessage::getClassId, classId));
    }
}